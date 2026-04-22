/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as reportReady } from './report-ready-notification.tsx'
import { template as mindTrackCompletion } from './mind-track-completion.tsx'
import { template as b2bDemoConfirm } from './b2b-demo-request-confirmation.tsx'
import { template as b2bDemoAdmin } from './b2b-demo-request-admin.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'report-ready-notification': reportReady,
  'mind-track-completion': mindTrackCompletion,
  'b2b-demo-request-confirmation': b2bDemoConfirm,
  'b2b-demo-request-admin': b2bDemoAdmin,
}
