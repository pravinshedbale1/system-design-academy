const fs = require('fs');
let code = fs.readFileSync('Sidebar.tsx', 'utf8');
code = code.replace(
  /className=\`fixed top-14 bottom-0[^\`]+\`/g,
  'className={`fixed top-14 bottom-0 w-[280px] md:w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-50 transition-transform duration-300 left-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}'
);
fs.writeFileSync('Sidebar.tsx', code);
