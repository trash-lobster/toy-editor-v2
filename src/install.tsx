import { Skeleton } from './components/skeleton';

export function installApp() {
    const App = () => (
        <Skeleton/>
    )

    return {
        App,
    }
}