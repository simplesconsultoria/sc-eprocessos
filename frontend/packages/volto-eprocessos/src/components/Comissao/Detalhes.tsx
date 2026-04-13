import { Container, Tabs } from '@plone/components';
import { Tab, TabList, TabPanel } from 'react-aria-components';
import type { ReactNode } from 'react';

interface DetalhesPanel {
  id: string;
  title: string;
  content: ReactNode;
}

interface DetalhesProps {
  items: DetalhesPanel[];
}

const Detalhes = ({ items }: DetalhesProps) => {
  return (
    <Container className="comissao-panels" width={'layout'}>
      <Tabs>
        <TabList aria-label="Detalhes da Comissão">
          {items?.map((item) => (
            <Tab key={item.id} id={item.id}>
              {item.title}
            </Tab>
          ))}
        </TabList>
        {items?.map((item) => (
          <TabPanel key={item.id} id={item.id}>
            {item.content}
          </TabPanel>
        ))}
      </Tabs>
    </Container>
  );
};

export default Detalhes;
