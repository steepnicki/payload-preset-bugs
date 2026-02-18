import { BOOKING_STATUS_MAP } from '@/lib/booking-status'
import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'bookingId',
    group: 'Bookings',
    listSearchableFields: ['bookingId'],
    defaultColumns: ['bookingId', 'bookingStatus', 'organisation', 'createdAt'],
  },
  enableQueryPresets: true,
  fields: [
    {
      name: 'bookingId',
      label: 'Booking ID',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'organisation',
      label: 'Organisation',
      type: 'select',
      options: [
        {
          label: 'Mock 1',
          value: 'MOCK_1',
        },
        {
          label: 'Mock 2',
          value: 'MOCK_2',
        },
        {
          label: 'Mock 3',
          value: 'MOCK_3',
        },
      ],
    },
    {
      name: 'bookingStatus',
      label: 'Booking Status',
      type: 'select',
      required: true,
      options: Object.entries(BOOKING_STATUS_MAP).map(([key, status]) => ({
        label: status.shortLabel,
        value: key,
      })),
      defaultValue: 'requested',
    },
  ],
}
