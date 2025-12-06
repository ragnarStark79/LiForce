const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-smooth
              ${
                activeTab === tab.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
