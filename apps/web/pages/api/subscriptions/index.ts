import { NextApiRequest, NextApiResponse } from 'next/types';
import Stripe from 'stripe';
import PermissionsService from 'services/permissions';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

export async function index({ communityId }: { communityId: string }) {
  const response1 = await stripe.customers.search({
    query: `name:\'CUSTOMER ${communityId}\'`,
  });
  const customer = response1.data[0];
  const response2 = await stripe.subscriptions.list({
    customer: customer.id,
  });
  const subscription = response2.data[0];
  return {
    status: 200,
    data: {
      customer,
      subscription,
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const communityId = request.query.communityId as string;
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId,
    },
  });
  if (!permissions.manage) {
    return response.status(401).json({});
  }
  const { status, data } = await index({ communityId });
  return response.status(status).json(data);
}
