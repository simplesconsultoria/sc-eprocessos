import { Container } from '@plone/components';
import Image from '@plone/volto/components/theme/Image/Image';
import type { Vereador } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Email } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Email';

interface SumarioProps {
  content: Vereador;
}

const Sumario = ({ content }: SumarioProps) => {
  const { title, image } = content;
  const img_src = image && image.length > 0 ? image[0].download : null;
  const fotoAlt = `Foto de ${title}`;
  return (
    <Container width={'default'} className="sumario">
      <h1 className="documentFirstHeading">{title}</h1>
      <div id={'card'}>
        <div className={'image'}>
          {img_src && (
            <Image
              src={`${content['@id']}/${img_src}`}
              alt={fotoAlt}
              className={'portrait'}
            />
          )}
        </div>
        <Container className={'dados'}>
          <p>
            <strong>Nome Civil:</strong> {content.fullname}
            <br />
            <strong>Partido:</strong> {content.description}
            <br />
            <strong>Telefone:</strong> {content.telefone_gabinete}
            <br />
            {content.email && (
              <>
                <strong>E-mail:</strong> <Email value={content.email} />
                <br />
              </>
            )}
            {content.birthday && (
              <>
                <strong>Nascimento:</strong>{' '}
                <DataCurta date={content.birthday} />
                <br />
              </>
            )}
          </p>
        </Container>
      </div>
    </Container>
  );
};

export default Sumario;
