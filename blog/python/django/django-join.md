---
title: Django联表查询详解：从主表到从表，从从表到主表
date: 2024-08-14T21:05
authors: bronya0
keywords:
  - django
tags: 
  - django
---
Django中，联表查询是指从多个相关模型中获取数据。这些模型之间通过ForeignKey、ManyToManyField等字段建立关系，掌握好查询语法对提高开发效率非常重要。
<!-- truncate -->

## 1. 模型定义
首先看一个典型的一对多关系模型定义:

通过related_name指定反向关系名，不指定则默认为`book_set`
```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()

class Book(models.Model):
    title = models.CharField(max_length=200) 
    price = models.DecimalField(max_digits=5, decimal_places=2)
    
    author = models.ForeignKey(
        Author, 
        on_delete=models.CASCADE,
        related_name='my_books'
    )
```

## 2. 从表查主表(正向关系)

### 2.1 通过外键字段直接查询
只查关联字段：
```python
# 方式1:使用 _id 后缀,直接查询外键值
book = Book.objects.filter(author_id=1)

# 方式2:使用外键字段名
book = Book.objects.filter(author=1)
```

### 2.2 跨表查询主表字段
跨表查关联表的字段，用双下划线`__`

```python
# 使用双下划线(__)跨表查询
books = Book.objects.filter(author__name='张三')  
books = Book.objects.filter(author__age__gt=30)

# 使用select_related()优化查询
books = Book.objects.select_related('author').filter(author__name='张三')
```

- select_related() 用于优化一对一或多对一关系的查询
- 适合在后续代码中需要访问关联表数据的场景
- 会立即执行 JOIN 查询

## 3. 主表查从表(反向关系)

### 3.1 使用默认反向关系名
反向关系，未指定related_name时，默认使用 `模型名小写_set`，很好理解，就是和主表关联的从表数据的set集合
```python
author = Author.objects.get(id=1)
books = author.book_set.all()  # 获取作者的所有图书
```

### 3.2 使用自定义反向关系名
也可以自己在模型定义的时候，在从表Book的外键author字段里指定`related_name`，比如my_books，用来让author过来。
跨表过滤，还是双下划线：

```python
# 使用指定的related_name
author = Author.objects.get(id=1) 
books = author.my_books.all()
authors = Author.objects.filter(my_books__price__gt=100)
```

### 3.3 反向关系优化
```python
# 使用prefetch_related优化一对多/多对多查询
authors = Author.objects.prefetch_related('my_books').all()
```
- prefetch_related() 用于优化一对多或多对多关系查询
- 会执行两次查询而不是 JOIN
- 适合需要遍历查询结果的场景

## 4. 复杂查询示例

### 4.1 多表连接查询
同时连接多个表
```python
# 同时连接多个表
books = Book.objects.select_related('author', 'publisher').filter(
    author__name='张三',
    publisher__name='某出版社'  
)
```

### 4.2 聚合查询
其实就是select count(xxx), AVG(xxx) from ... XX join ... ON ...
ON的条件就是外键关系定义的，django自动去关联

```python
from django.db.models import Count, Avg

# 统计每个作者的图书数量和平均价格
authors = Author.objects.annotate(
    book_count=Count('my_books'),
    avg_price=Avg('my_books__price')
)

# 查询每个作者出版的书的平均价格
authors = Author.objects.annotate(avg_price=Avg('books__price'))
for author in authors:
    print(author.name, author.avg_price)

```

### 4.3 F表达式跨字段查询
F允许在查询时引用模型字段的值，在进行跨表查询和字段比较时特别有用。

```python
from django.db.models import F

# 查询作者年龄大于图书价格的数据
books = Book.objects.filter(author__age__gt=F('price'))

# 找出所有出版年份比作者出生年份晚至少20年的书。
books = Book.objects.select_related('author').annotate(
    years_since_birth=F('publication_year') - F('author__birth_year')
).filter(years_since_birth__gte=20)

```
## 5.性能

### 5.1 N+1
N+1 问题是一个常见的性能瓶颈。假设我们有一个 Author 模型和一个 Book 模型，Book 通过外键关联到 Author。如果我们想查询所有书籍及其作者，可能会写出以下代码：

```python
books = Book.objects.all()
for book in books:
    print(book.title, book.author.name)
```
这段代码会导致：
1 次查询获取所有书籍（SELECT * FROM book）。
对于每本书，1 次查询获取对应的作者（SELECT * FROM author WHERE id = ?）。
如果有 100 本书，就会产生 101 次查询（1 + 100），这就是 N+1 问题。

### select_related
使用`select_related`和`prefetch_related`优化查询性能

`select_related` 通过 单次 SQL JOIN 查询，将主表和关联表的数据一次性加载到内存中。适用于 一对一（OneToOneField） 和 多对一（ForeignKey） 关系。


示例：
```python
# 使用 select_related 优化查询
books = Book.objects.select_related('author').all()
for book in books:
    print(book.title, book.author.name)
```

生成的 SQL
```sql
SELECT book.id, book.title, book.author_id, author.id, author.name
FROM book
INNER JOIN author ON book.author_id = author.id;
```

**优点**
- 只需要 1 次查询，性能显著提升。
- 数据一次性加载到内存中，减少数据库访问次数。

**缺点**
- 只适用于单层关联（不能用于多对多关系）。
- 如果关联表数据量很大，可能会导致内存占用过高。

### prefetch_related
`prefetch_related`通过 两次查询 来优化性能，适用于 多对多（ManyToManyField） 和 反向查询（从从表到主表）

- 第一次查询主表数据。
- 第二次查询关联表数据，并将它们缓存到内存中。
- Django 在 Python 层面将主表和关联表的数据进行匹配。

示例：

```python
# 使用 prefetch_related 优化查询
authors = Author.objects.prefetch_related('books').all()
for author in authors:
    print(author.name)
    for book in author.books.all():
        print(book.title)
```

生成的 SQL
查询所有作者：
```sql
SELECT * FROM author;
```
查询所有书籍，并过滤出与作者相关的书籍：
```sql
SELECT * FROM book WHERE author_id IN (1, 2, 3, ...);
```

**优点**
支持多对多关系和反向查询。
通过两次查询解决 N+1 问题，性能提升。

**缺点**
数据在 Python 层面进行匹配，可能会占用较多内存。
不适合单层关联（此时 select_related 更高效）。

## 6. 总结

1. 字段跨表查询规则:
- 正向关系:外键字段名__关联表字段
- 反向关系:反向关系名__字段名
- 主键查询可以用单下划线(_id)


2. 性能:
- select_related() 用于一对一/多对一关系
- prefetch_related() 用于一对多/多对多关系
- 按需使用,避免过度优化

3. 反向关系命名:
- 默认为"模型名小写_set" 
- 可通过 related_name 自定义
- 命名要见名知意

4. N+1 查询问题:
- 循环查询关联表会导致大量查询
- 合理使用 select_related/prefetch_related
- 尽量一次性获取所需数据

5. 查询优化:
- 只查询需要的字段(values/values_list)
- 避免重复查询(缓存结果)
- 使用索引