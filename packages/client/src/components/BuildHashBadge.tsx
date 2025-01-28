export const BuildHashBadge = () => {
    if (!import.meta.env.VITE_GIT_COMMIT_HASH) return null;

    return (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-400 transition-colors duration-200">
            <span className="font-mono text-sm">λ</span>
            <span>{import.meta.env.VITE_GIT_COMMIT_HASH.slice(0, 7)}</span>
        </div>
    );
}; 