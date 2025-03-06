import dotenv from 'dotenv'
import { Request, Response } from 'express'
import { supabase } from '@/utils/supabaseClient'
import { handleError } from '@/utils/errorHandler'

dotenv.config()

export const getAnalyzedItemById = async (req: Request, res: Response): Promise<unknown> => {
  try {
    const { id } = req.params

    // Query Supabase table where the analysis results are stored
    const { data, error, status } = await supabase
      .from('analysis_results') // Change to the actual table name
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(status || 500).json({ message: 'Error fetching data', error })
    }

    if (!data) {
      return res.status(404).json({ message: 'Analysis result not found' })
    }

    res.status(200).json({ message: 'Analysis retrieved successfully', data })
  } catch (error: unknown) {
    handleError(res, error)
  }
}

export const getGeneralDetailById = async (req: Request, res: Response): Promise<unknown> => {
  try {
    const { id } = req.params

    // Query Supabase for general analysis details
    const { data, error, status } = await supabase
      .from('analysis_details') // Change to the actual table name
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(status || 500).json({ message: 'Error fetching general details', error })
    }

    if (!data) {
      return res.status(404).json({ message: 'General analysis details not found' })
    }

    res.status(200).json({ message: 'General details retrieved successfully', data })
  } catch (error) {
    handleError(res, error)
  }
}
