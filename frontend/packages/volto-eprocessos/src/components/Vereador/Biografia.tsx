import { Container } from '@plone/components';

interface BiografiaProps {
  content: string;
}

const Biografia = ({ content }: BiografiaProps) => {
  return (
    <Container className="vereador-biografia">
      <div
        className={'biografia'}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Container>
  );
};

export default Biografia;
