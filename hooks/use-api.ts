"use client"

import { useState, useEffect } from "react"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiCall()
      setState({ data: result, loading: false, error: null })
    } catch (error) {
      console.error("API call failed:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return {
    ...state,
    refetch: fetchData,
  }
}

export function useApiMutation<T, P = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = async (apiCall: (params: P) => Promise<T>, params: P) => {
    setState({ data: null, loading: true, error: null })

    try {
      const result = await apiCall(params)
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }

  return {
    ...state,
    mutate,
    reset: () => setState({ data: null, loading: false, error: null }),
  }
}
