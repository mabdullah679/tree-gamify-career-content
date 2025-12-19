import { Page3Tree } from './pages/Page3Tree';
import { renderShell } from './shell';

const shell = renderShell('tree');
const page = new Page3Tree(shell.content);
page.render();
