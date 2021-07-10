import styles from './App.module.css'
import Simulator from "../simulator/Simulator.module";
import Window from '../window/Window.module';

function App() {
  return (
    <div className={styles.container}>
        <Window name="Simulator" description="Viking CPU Simulator" >
          <Simulator />
        </Window>
    </div>
  );
}

export default App;
