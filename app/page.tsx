import { initFs } from "../components/core/filesystem/FileSystem";
import WindowsView from "../components/core/windows/WindowsView";
import Desktop from "../components/desktop/Desktop";

const App = () => {
    initFs();
    return (
        <div>
            <Desktop />
            <WindowsView />
        </div>
    );
}

export default App;