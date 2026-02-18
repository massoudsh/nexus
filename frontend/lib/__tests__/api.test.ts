/**
 * API helper tests.
 */
import { getApiErrorMessage } from '../api'
import axios from 'axios'

describe('getApiErrorMessage', () => {
  it('returns detail string from axios error response', () => {
    const err = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 400, data: { detail: 'Invalid input' } },
    })
    expect(getApiErrorMessage(err)).toBe('Invalid input')
  })

  it('returns generic message for 401 when no detail', () => {
    const err = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 401 },
    })
    expect(getApiErrorMessage(err)).toBe('Please sign in to continue.')
  })

  it('returns fallback for non-Error', () => {
    expect(getApiErrorMessage('unknown')).toBe('Something went wrong. Please try again.')
  })
})
