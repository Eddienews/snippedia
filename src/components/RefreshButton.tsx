
interface RefreshButtonProps {
  onRefresh: () => void;
}

const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  return (
    <div className="px-4 py-2">
      <button
        onClick={onRefresh}
        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
      >
        <span>🔄</span>
        <span>Refresh articles</span>
      </button>
    </div>
  );
};

export default RefreshButton;
