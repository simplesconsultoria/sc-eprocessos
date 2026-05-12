import { Container, Tabs } from '@plone/components';
import { Tab, TabList, TabPanel, TabPanels } from 'react-aria-components';
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
    <Container className="vereador-panels" width={'layout'}>
      <Tabs>
        <TabList aria-label="Detalhes do Vereador" items={items}>
          {(item) => <Tab id={item.id}>{item.title}</Tab>}
        </TabList>
        <TabPanels items={items}>
          {(item) => <TabPanel id={item.id}>{item.content}</TabPanel>}
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Detalhes;
