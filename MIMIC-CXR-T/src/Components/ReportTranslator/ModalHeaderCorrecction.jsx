import {Form, Row, Card, Col} from 'react-bootstrap';

function ModalHeaderCorrecction({ originalSentence, translatedSentence }) {
  return (
    <div className="modal-header">
      <Card border="secondary" className="container-header">
        <Card.Header>
          <Row>
            <Col>
              <div>Oración original</div>
            </Col>
            <Col>
              <div>Traducción</div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col>
              <Form.Label className="sentence-font">
                {originalSentence}
              </Form.Label>
            </Col>
            <Col>
              <Form.Label className="sentence-font">
                {translatedSentence}
              </Form.Label>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ModalHeaderCorrecction;
