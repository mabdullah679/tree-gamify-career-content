import { Page4Achievements } from './pages/Page4Achievements';
import { renderShell } from './shell';

const shell = renderShell('achievements');
const page = new Page4Achievements(shell.content);
page.render();
