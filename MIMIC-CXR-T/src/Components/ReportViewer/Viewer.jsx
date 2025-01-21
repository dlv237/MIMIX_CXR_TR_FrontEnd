import { useState } from 'react';
import { Table, Form, Container, Row, Col } from 'react-bootstrap';
import './viewer.css';
import ReportsTable from './ReportsTable';
function Viewer({  
  report, 
}) {
  const [isSwitchChecked, setIsSwitchChecked] = useState(true);

  function ReportTable({ report }) {
    const renderRows = (report) => {
      return (
        <div>
          <ReportsTable
            report={report}
            isSwitchChecked={isSwitchChecked}
          />
        </div>
      )
    };

    return (
      <>
      <Container className='min-h-[90vh] mt-12'>
        <Row>
          <Col xs={4}>
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Mostrar encabezado de la sección"
                checked={isSwitchChecked}
                onChange={() => setIsSwitchChecked(!isSwitchChecked)}
                className="custom-switch"
              />
            </Form>
          </Col>
        </Row>
        <Row className='min-w-fit justify-self-center'>
        <Table striped hover responsive="lg" className="custom-table text-start min-w-fit">
          <tbody className="divide-y divide-gray-200">
            {renderRows(report)}
          </tbody>
        </Table>

        </Row>
      </Container>
      </>
    );
  }

  return <ReportTable report={report.report}/>;
}

export default Viewer;