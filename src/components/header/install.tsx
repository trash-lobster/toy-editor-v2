import { Header as InternalHeader } from './header';

export function installHeader(toggleLeft: () => void, toggleRight: () => void) {
    const Header = () => (
        <InternalHeader toggleLeftPanel={toggleLeft} toggleRightPanel={toggleRight} />
    );
    
    return {
        Header
    }
}