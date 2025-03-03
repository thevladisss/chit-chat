import { Home } from './pages/Home/index.jsx';
import './index.css';

//TODO: Group all .css files into one file and then import one file here

import '../style/text-utils.css';

export function App() {
  return (
      <main>
        <Home></Home>
      </main>
  );
}

export default App;
