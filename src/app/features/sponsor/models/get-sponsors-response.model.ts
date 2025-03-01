import { BecomeSponsorLink } from "./become-sponsor-link.model";
import { ClassIdMappings } from "./class-id-mappings.model";
import { FrequencyIdMappings } from "./frequency-id-mappings.model";
import { Sponsor } from "./sponsor.model";

export interface GetSponsorsResponse {
    classIdMappings: ClassIdMappings;
    frequencyIdMappings: FrequencyIdMappings;
    becomeSponsorLinks: BecomeSponsorLink[];
    sponsors: Sponsor[];
}