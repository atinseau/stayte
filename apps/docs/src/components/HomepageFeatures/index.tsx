import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

import { TbBrandTypescript } from "react-icons/tb";
import { LuTestTube2 } from "react-icons/lu";
import { AiFillSignal } from "react-icons/ai";
import { LuTimerReset } from "react-icons/lu";
import { FiServer } from "react-icons/fi";
import { TbSchema } from "react-icons/tb";



type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Signal-Like',
    Svg: AiFillSignal,
    description: (
      <>Gluon is inspired by the signal concept, you can subscribe to a gluon and get notified when it changes</>
    )
  },
  {
    title: 'Peristent State',
    Svg: LuTimerReset,
    description: (
      <>Create peristent state with ease by using cookies, query, local storage or session storage</>
    )
  },
  {
    title: 'Type-Safe',
    Svg: TbBrandTypescript,
    description: (
      <>Fully typed library, smart enough to infer the type of your gluon</>
    ),
  },
  {
    title: 'SSR Friendly',
    Svg: FiServer,
    description: (
      <>Gluon can work with SSR just by applying a simple patch</>
    ),
  },
  {
    title: 'Fully Tested',
    Svg: LuTestTube2,
    description: (
      <>Unit tests is runned on every commit and every pull request</>
    ),
  },
  {
    title: 'Zod Validation',
    Svg: TbSchema,
    description: (
      <>Zod is used to validate the default value and every new value set by the user of the gluon</>
    ),
  }
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={"w-full"}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-12 max-w-[1080px] mx-auto'>
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
