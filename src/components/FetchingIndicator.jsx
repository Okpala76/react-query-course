import Loader from "./Loader";
import { useIsFetching } from "@tanstack/react-query"

export default function FetchingIndicator() {
    const isFetching = useIsFetching();

    if (!isFetching) { return null; }

    return ( <div className="fetching-indicator">
        <Loader/>
    </div>
    )
}