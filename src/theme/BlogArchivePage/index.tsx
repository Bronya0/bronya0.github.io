/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';
import {useDateTimeFormat} from '@docusaurus/theme-common/internal';
import Layout from '@theme/Layout';
import type {ArchiveBlogPost, Props} from '@theme/BlogArchivePage';
import Heading from '@theme/Heading';

type YearProp = {
  year: string;
  posts: ArchiveBlogPost[];
};

function Year({year, posts}: YearProp) {
  const dateTimeFormat = useDateTimeFormat({
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  const formatDate = (lastUpdated: string) =>
    dateTimeFormat.format(new Date(lastUpdated));

  return (
    <>
      <Heading as="h3" id={year}>
        {year}
      </Heading>
      <ul>
        {posts.map((post) => (
          <li key={post.metadata.date}>
            <Link to={post.metadata.permalink}>
              {formatDate(post.metadata.date)} - {post.metadata.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function YearsSection({years}: {years: YearProp[]}) {
  return (
    <section className="margin-vert--lg">
      <div className="container">
        <div className="row">
          {years.map((_props, idx) => (
            <div key={idx} className="col margin-vert--lg">
              <Year {..._props} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// function listPostsByYears(blogPosts: readonly ArchiveBlogPost[]): SeasonProp[] {
//   const postsBySeason = blogPosts.reduce((posts, post) => {
//     const year = post.metadata.date.split('-')[0];
//     const month = parseInt(post.metadata.date.split('-')[1]);
    
//     // 确定季节
//     let season;
//     if (month >= 3 && month <= 5) {
//       season = year + "-春";  // 春季 3-5月
//     } else if (month >= 6 && month <= 8) {
//       season = year + "-夏";  // 夏季 6-8月
//     } else if (month >= 9 && month <= 11) {
//       season = year + "-秋";  // 秋季 9-11月
//     } else {
//       season = year + "-冬";  // 冬季 12,1,2月
//     }
    
//     const seasonPosts = posts.get(season) ?? [];
//     return posts.set(season, [post, ...seasonPosts]);
//   }, new Map<string, ArchiveBlogPost[]>());

//   return Array.from(postsBySeason, ([season, posts]) => ({
//     season,
//     posts,
//   }));
// }

function listPostsByYears(blogPosts: readonly ArchiveBlogPost[]): YearProp[] {
  const postsByYear = blogPosts.reduce((posts, post) => {
    const year = post.metadata.date.split('-')[0]
    // const year = post.metadata.date.split('-')[0] +"-" + post.metadata.date.split('-')[1];
    const yearPosts = posts.get(year) ?? [];
    return posts.set(year, [post, ...yearPosts]);
  }, new Map<string, ArchiveBlogPost[]>());

  // 对每个年份的文章进行倒序排序
  for (const [year, posts] of postsByYear) {
    posts.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date));
  }

  // 将年份按倒序排列
  const sortedYears = Array.from(postsByYear, ([year, posts]) => ({
    year,
    posts,
  })).sort((a, b) => b.year.localeCompare(a.year));

  return sortedYears;
}

export default function BlogArchive({archive}: Props): JSX.Element {
  const title = translate({
    id: 'theme.blog.archive.title',
    message: 'Archive',
    description: 'The page & hero title of the blog archive page',
  });
  const description = translate({
    id: 'theme.blog.archive.description',
    message: 'Archive',
    description: 'The page & hero description of the blog archive page',
  });
  const years = listPostsByYears(archive.blogPosts);
  return (
    <>
      <PageMetadata title={title} description={description} />
      <Layout>
        <header className="hero hero--primary">
          <div className="container">
            <Heading as="h1" className="hero__title">
              {title}
            </Heading>
            <p className="hero__subtitle">{description}</p>
          </div>
        </header>
        <main>{years.length > 0 && <YearsSection years={years} />}</main>
      </Layout>
    </>
  );
}
