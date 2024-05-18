import { QUERY_PARAMETER } from "../stores/router";

export const isP1 = () => QUERY_PARAMETER.value.get('id') !== 'p2';