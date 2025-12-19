import { Page2Timeline } from './pages/Page2Timeline';
import { renderShell } from './shell';

const shell = renderShell('timeline');
const page = new Page2Timeline(shell.content);
page.render();
