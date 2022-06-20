import { ContactFindAllQuery } from "./contact.findAll";
import { ContactFindByIdQuery } from "./contact.findById";
import { ContactRoleFindAllQuery } from "./contactRole.findAll";
import { RegionFindAllQuery } from "./region.findAll";

export const queries = [
    ContactFindAllQuery,
    ContactFindByIdQuery,
    RegionFindAllQuery,
    ContactRoleFindAllQuery,
];
