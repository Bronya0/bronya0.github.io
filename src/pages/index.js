import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
          <div className="container">
              <Heading as="h1" className="hero__title">
                  {siteConfig.title}
              </Heading>
              <p className="hero__subtitle">{siteConfig.tagline}</p>
              <div className={styles.buttons}>
                  <Link
                      className="button button--secondary button--lg"
                      to="/posts">
                      进入博客
                  </Link>
              </div>
          </div>

      </header>

  );
}

// 主页内容，banner、特性介绍啥的
export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
      <Layout
          title={`${siteConfig.title}`}
          description="个人技术博客">
          <HomepageHeader/>

          {/*<main>*/}
          {/*  <HomepageFeatures />*/}
          {/*</main>*/}
      </Layout>
  );
}
