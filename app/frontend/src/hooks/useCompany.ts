import { useEffect, useState } from 'react'
import { fetchCompany, type Company } from '../lib/api.ts'

let companyPromise: Promise<Company> | null = null

export function resetCompanyCache(): void {
  companyPromise = null
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    const promise = companyPromise ?? fetchCompany()
    companyPromise = promise

    promise
      .then((data) => {
        if (active) setCompany(data)
      })
      .catch(() => {
        companyPromise = null
        if (active) setError(true)
      })

    return () => {
      active = false
    }
  }, [])

  return { company, error }
}