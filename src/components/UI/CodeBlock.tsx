interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'http' }: CodeBlockProps) {
  const lines = code.trim().split('\n');

  const colorize = (line: string) => {
    if (line.startsWith('POST') || line.startsWith('GET') || line.startsWith('PUT') || line.startsWith('DELETE')) {
      const method = line.split(' ')[0];
      const rest = line.slice(method.length);
      const methodColor = method === 'GET' ? 'text-emerald-400' : method === 'POST' ? 'text-indigo-400' : method === 'DELETE' ? 'text-red-400' : 'text-amber-400';
      return <><span className={methodColor}>{method}</span><span className="text-gray-300">{rest}</span></>;
    }
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return <span className="text-gray-500 italic">{line}</span>;
    }
    if (line.includes('→')) {
      const parts = line.split('→');
      return <><span className="text-gray-300">{parts[0]}</span><span className="text-amber-400">→</span><span className="text-emerald-400">{parts.slice(1).join('→')}</span></>;
    }
    return <span className="text-gray-300">{line}</span>;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        {language && <span className="ml-2 text-xs text-gray-500 font-mono">{language}</span>}
      </div>
      <pre className="bg-gray-900 p-4 overflow-x-auto font-mono text-sm leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-gray-600 select-none w-5 text-right flex-shrink-0">{i + 1}</span>
            <div>{colorize(line)}</div>
          </div>
        ))}
      </pre>
    </div>
  );
}
