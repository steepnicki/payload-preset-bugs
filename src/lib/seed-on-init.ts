import type { Payload } from 'payload'

const MOCK_BOOKINGS = [
  { bookingId: 'BUG-001', bookingStatus: 'requested', organisation: 'MOCK_1' },
  { bookingId: 'BUG-002', bookingStatus: 'requested', organisation: 'MOCK_2' },
  { bookingId: 'BUG-003', bookingStatus: 'counterOffer', organisation: 'MOCK_1' },
  { bookingId: 'BUG-004', bookingStatus: 'counterOffer', organisation: 'MOCK_2' },
  { bookingId: 'BUG-005', bookingStatus: 'actChange', organisation: 'MOCK_1' },
  { bookingId: 'BUG-006', bookingStatus: 'actChange', organisation: 'MOCK_1' },
  { bookingId: 'BUG-007', bookingStatus: 'confirmed', organisation: 'MOCK_3' },
  { bookingId: 'BUG-008', bookingStatus: 'confirmed', organisation: 'MOCK_2' },
  { bookingId: 'BUG-009', bookingStatus: 'cancelled', organisation: 'MOCK_2' },
  { bookingId: 'BUG-010', bookingStatus: 'cancelled', organisation: 'MOCK_3' },
  { bookingId: 'BUG-011', bookingStatus: 'completed', organisation: 'MOCK_3' },
  { bookingId: 'BUG-012', bookingStatus: 'completed', organisation: 'MOCK_3' },
] as const

const MOCK_USER_EMAIL = 'example@example.com'
const MOCK_USER_PASSWORD = 'example123'

const FULL_YEAR_ALL_PRESET = {
  title: 'Full Year All',
  isShared: true,
  access: {
    read: { constraint: 'everyone' },
    update: { constraint: 'everyone' },
    delete: { constraint: 'everyone' },
  },
  where: {
    or: [
      {
        and: [
          {
            bookingStatus: {
              in: ['requested', 'performed', 'confirmed', 'completed', 'actChange', 'counterOffer'],
            },
          },
        ],
      },
    ],
  },
  relatedCollection: 'bookings',
  columns: [
    { accessor: 'id', active: true },
    { accessor: 'bookingId', active: true },
    { accessor: 'bookingStatus', active: true },
    { accessor: 'createdAt', active: false },
    { accessor: 'updatedAt', active: false },
  ],
} as const

export async function seedMockBookingsOnInit(payload: Payload): Promise<void> {
  if (process.env.PAYLOAD_DISABLE_SEEDING === 'true') return

  const userId = await ensureMockUser(payload)

  for (const booking of MOCK_BOOKINGS) {
    const existing = await payload.find({
      collection: 'bookings',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        bookingId: {
          equals: booking.bookingId,
        },
      },
    })

    if (existing.docs.length > 0) continue

    await payload.create({
      collection: 'bookings',
      overrideAccess: true,
      data: booking,
    })
  }

  await seedQueryPresets(payload, userId)
}

async function ensureMockUser(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'users',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      email: {
        equals: MOCK_USER_EMAIL,
      },
    },
  })

  if (existing.docs.length > 0) return String(existing.docs[0].id)

  const created = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: MOCK_USER_EMAIL,
      password: MOCK_USER_PASSWORD,
    },
  })

  return String(created.id)
}

async function seedQueryPresets(payload: Payload, userId: string): Promise<void> {
  const fullYearAllExisting = await payload.find({
    collection: 'payload-query-presets',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          title: {
            equals: FULL_YEAR_ALL_PRESET.title,
          },
        },
        {
          relatedCollection: {
            equals: 'bookings',
          },
        },
      ],
    },
  })

  if (fullYearAllExisting.docs.length === 0) {
    await payload.create({
      collection: 'payload-query-presets',
      overrideAccess: true,
      data: FULL_YEAR_ALL_PRESET,
    })
  }

  const duplicatedUsersExisting = await payload.find({
    collection: 'payload-query-presets',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          title: {
            equals: 'DUPLICATED USERS',
          },
        },
        {
          relatedCollection: {
            equals: 'bookings',
          },
        },
      ],
    },
  })

  if (duplicatedUsersExisting.docs.length === 0) {
    await payload.create({
      collection: 'payload-query-presets',
      overrideAccess: true,
      data: {
        title: 'DUPLICATED USERS',
        isShared: true,
        access: {
          read: {
            constraint: 'specificUsers',
            users: [userId, userId],
          },
          update: {
            constraint: 'specificUsers',
            users: [userId, userId],
          },
          delete: {
            constraint: 'specificUsers',
            users: [userId, userId],
          },
        },
        relatedCollection: 'bookings',
      },
    })
  }
}
