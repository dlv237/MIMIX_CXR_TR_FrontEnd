import './App.css'
import MyNavBar from '../Components/Nav';


function App() {
  return (
     <div className="App-page">
      <MyNavBar/>
      <main>
        <section className="left-section">
          <h1>Proyecto MIMIC-CXR-Translation</h1>
          <p> El propósito de esta plataforma es traducir el conjunto de datos MIMIC-CXR del inglés al español. Los profesionales médicos seleccionados pueden introducir y corregir traducciones realizadas por computadora para volver a capacitarse en el futuro y mejorar el rendimiento de la traducción.</p>
      
          <p> The purpose of this platform is to translate the MIMIC-CXR dataset from English to Spanish. Selected medical professionals can input and correct computer-made translations to be retrained in the future and improve translation performance.</p>
          <p> FONDECYT Regular 1231724 </p>
          <p> Multimodal, multitask and trasfer learning for Deep radiological report generation</p>
         </section>

      </main>

      <footer>
        <p>© 2023 Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;


