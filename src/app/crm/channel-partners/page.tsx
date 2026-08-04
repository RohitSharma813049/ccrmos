import { Metadata } from 'next';
import ChannelPartnersClient from '@/modules/partners/components/ChannelPartnersClient';

export const metadata: Metadata = {
  title: 'Channel Partners | CRM OS',
  description: 'Manage channel partner accounts',
};

export default function ChannelPartnersPage() {
  return <ChannelPartnersClient />;
}
