import { getContent, json } from '../_lib/auth.js';
export async function onRequestGet({ request, env }) {
  return json(await getContent(env, request));
}
