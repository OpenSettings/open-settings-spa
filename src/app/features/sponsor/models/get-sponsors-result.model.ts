import { GetSponsorsResponse } from "./get-sponsors-response.model";

export interface GetSponsorsResult {
    data: GetSponsorsResponse;
    fromFallback: boolean;
}