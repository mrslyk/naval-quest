import './styles.css';
import { Game } from './engine/Game';

const app = document.getElementById('app');
if (app) {
  new Game(app);
}
