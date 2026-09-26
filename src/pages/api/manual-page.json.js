import seedDB from '../../data/manual-pages.json';
import { getPageById } from '../../utils/manualStore.js';

export const prerender = false;

export async function GET({ url, platform }) {
  const pageId = url.searchParams.get('id');
  if (!pageId) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });

  let page = null;
  try {
    page = await getPageById({ pageId, platform });
  } catch(e) {}
  if (!page) {
    page = (seedDB.pages || []).find(p => p.id === pageId);
  }

  return new Response(JSON.stringify({ page }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
