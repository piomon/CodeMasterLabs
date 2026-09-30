import * as delivery from './20260929_003_submission_delivery'
import * as initial from './20260928_001_initial'
import * as reset from './20260928_002_password_reset'
export const migrations=[{name:'20260928_001_initial',up:initial.up,down:initial.down},{name:'20260928_002_password_reset',up:reset.up,down:reset.down},{name:'20260929_003_submission_delivery',up:delivery.up,down:delivery.down}]
