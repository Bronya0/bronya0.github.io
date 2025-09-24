import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function BlogTagsListPage({tags}) {
  const {siteConfig} = useDocusaurusContext();
  const tagList = Object.keys(tags);

  // 对标签列表进行排序
  const sortedTagList = tagList.sort((a, b) => {
    const firstCharA = a.charAt(0).toLowerCase();
    const firstCharB = b.charAt(0).toLowerCase();
    return firstCharA.localeCompare(firstCharB);
  });

  return (
    <Layout title="Tags">
      <div className="container">
        <h1 className="container-h1">博客标签</h1>
        <section class="row">
          {sortedTagList.map((tag) => (
            <article class="col col--2 margin-bottom--lg">
              <a
                class="card padding--lg cardContainer_Uewx"
                href={tags[tag].permalink}
              >
                <h2 class="text--truncate cardTitle_dwRT" title={tags[tag].label}>
                  {tags[tag].label}
                </h2>
                <p class="text--truncate cardDescription_mCBT" title={`${tags[tag].label} ${tags[tag].count}篇`}>
                  {tags[tag].count}篇
                </p>
              </a>
            </article>
          ))}
        </section>
      </div>
    </Layout>
  );
}

export default BlogTagsListPage;