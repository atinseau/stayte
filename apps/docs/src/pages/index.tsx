import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import { FcSettings } from "react-icons/fc";


import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';
import { useGluon } from 'stayte';

const code = `
import { useGluon } from "stayte";

const Counter = () => {
  const count = useGluon('count', {
    from: 'query',
    defaultValue: 10
  })

  return (
    <button onClick={() => count.value++}>
      count: {count.value}
    </button>
  )
}
`

const Counter = () => {
  const count = useGluon('count', {
    from: 'query',
  })

  return (
    <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
      count: {count.value ?? 0}
      <FcSettings/>
    </button>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner, "flex flex-wrap flex-col md:flex-row justify-center")}>
      <div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={clsx(styles.buttons, "flex flex-col gap-2")}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Read our docs - 5min ⏱️
          </Link>
        </div>
      </div>

      <div className='text-left'>
        <CodeBlock
          language="jsx"
          title='Index.tsx'
          metastring='qsd'
          showLineNumbers
          children={code.trim()}
        />
        <div className='flex gap-2 items-center'>
          <Counter />
          <p className='font-bold text-white mb-0'>Click here and watch the url !</p>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
