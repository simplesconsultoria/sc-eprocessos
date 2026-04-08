context('VereadoresSlider block', () => {
  let sourcePath;
  let documentPath;

  const svgDataUri =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#333" font-size="18">foto</text></svg>',
    );

  const vereadoresResponse = {
    items: [
      {
        '@id': 'http://localhost:3000/vereadores/1',
        id: '1',
        title: 'Vereador 1',
        fullname: 'Eliusmarcio Alves de Carvalho (Elinho da Academia)',
        description: 'MOBILIZA',
        image: [{ download: svgDataUri, filename: 'foto-1.svg' }],
      },
      {
        '@id': 'http://localhost:3000/vereadores/2',
        id: '2',
        title: 'Vereador 2',
        fullname: 'Abatenio de Andrade Marquez Neto',
        description: 'PP',
        image: [{ download: svgDataUri, filename: 'foto-2.svg' }],
      },
      {
        '@id': 'http://localhost:3000/vereadores/3',
        id: '3',
        title: 'Vereador 3',
        fullname: 'Nome curto',
        description: 'PSB',
        image: [{ download: svgDataUri, filename: 'foto-3.svg' }],
      },
    ],
  };

  const createDocumentWithSlider = (contentId) => {
    const sliderBlockId = '11111111-1111-1111-1111-111111111111';

    cy.createContent({
      contentType: 'Document',
      contentId,
      contentTitle: 'Vereadores slider test',
      bodyModifier: (body) => {
        const baseItems = body?.blocks_layout?.items || [];
        const titleBlock = baseItems[0];
        const slateBlock = baseItems[1];

        return {
          ...body,
          blocks: {
            ...(body.blocks || {}),
            [sliderBlockId]: {
              '@type': 'vereadoresSlider',
              source: [{ '@id': sourcePath, title: 'Vereadores' }],
              allLink: [{ '@id': 'https://example.com/vereadores' }],
              allLinkLabel: 'Ver todos',
              autoplay: false,
              autoplayIntervalSeconds: 5,
            },
          },
          blocks_layout: {
            items: [titleBlock, sliderBlockId, slateBlock].filter(Boolean),
          },
        };
      },
    });
  };

  beforeEach(() => {
    cy.viewport('macbook-16');

    // Ensure each test attempt uses a unique content id and source URL.
    // - Avoids backend 400 on duplicate ids when tests are retried.
    // - Avoids the View component's in-memory cache suppressing the request.
    const contentId = Cypress._.uniqueId('document-');
    documentPath = `/${contentId}`;
    sourcePath = `/@fake-vereadores?cy=${contentId}`;

    // Content creation uses basic auth, no need to autologin first.
    createDocumentWithSlider(contentId);

    cy.autologin();

    cy.intercept('GET', '**/@fake-vereadores*', {
      statusCode: 200,
      body: vereadoresResponse,
      headers: { 'content-type': 'application/json' },
    }).as('vereadores');
  });

  it('renders and navigates between items', () => {
    cy.visit(documentPath);
    cy.wait('@vereadores', { timeout: 20000 });
    cy.get('.vereadores-slider-block__heading', { timeout: 20000 }).should(
      'contain',
      'Vereadores',
    );

    cy.get('.vereadores-slider-block__name', { timeout: 20000 })
      .should('be.visible')
      .and('contain', 'Eliusmarcio');

    cy.get('.vereadores-slider-block__arrow--next').click();
    cy.get('.vereadores-slider-block__name').should('contain', 'Abatenio');

    cy.get('.vereadores-slider-block__arrow--prev').click();
    cy.get('.vereadores-slider-block__name').should('contain', 'Eliusmarcio');
  });

  it('keeps row height stable across items', () => {
    cy.visit(documentPath);
    cy.wait('@vereadores', { timeout: 20000 });
    cy.get('.vereadores-slider-block__name', { timeout: 20000 }).should(
      'contain',
      'Eliusmarcio',
    );

    cy.get('.vereadores-slider-block__row')
      .should('be.visible')
      .then(($row) => {
        const h1 = $row[0].getBoundingClientRect().height;

        cy.get('.vereadores-slider-block__arrow--next').click();
        cy.get('.vereadores-slider-block__row').then(($row2) => {
          const h2 = $row2[0].getBoundingClientRect().height;
          expect(Math.round(h2)).to.eq(Math.round(h1));
        });
      });
  });

  it('switches to column layout in very narrow container', () => {
    cy.visit(documentPath);
    cy.wait('@vereadores', { timeout: 20000 });
    cy.get('.vereadores-slider-block__name', { timeout: 20000 }).should(
      'contain',
      'Eliusmarcio',
    );

    // Force a very small container width to trigger the container query.
    cy.document().then((doc) => {
      const style = doc.createElement('style');
      style.innerHTML = `
        .vereadores-slider-block { width: 140px !important; }
      `;
      doc.head.appendChild(style);
    });

    cy.get('.vereadores-slider-block__row')
      .should('be.visible')
      .should('have.css', 'flex-direction', 'column');

    cy.get('.vereadores-slider-block__image').then(($img) => {
      const imgRect = $img[0].getBoundingClientRect();
      cy.get('.vereadores-slider-block__row').then(($row) => {
        const rowRect = $row[0].getBoundingClientRect();
        expect(imgRect.right).to.be.lte(rowRect.right + 1);
        expect(imgRect.bottom).to.be.lte(rowRect.bottom + 1);
      });
    });
  });
});
