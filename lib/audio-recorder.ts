// CultureLens — Audio Recorder (Browser MediaRecorder Wrapper)
// Handles real audio capture using the Web Audio API + MediaRecorder.
// This runs client-side only ('use client' in the component that uses it).

/**
 * Creates and manages a MediaRecorder instance for audio capture.
 *
 * Usage in a React component:
 *   const recorder = await createRecorder()
 *   recorder.start()
 *   // ... user records ...
 *   const blob = await recorder.stop()
 *   // upload blob to /api/sessions/[id]/upload
 */
export async function createRecorder(): Promise<{
  start: () => void
  stop: () => Promise<Blob>
  pause: () => void
  resume: () => void
  isRecording: () => boolean
}> {
  // TODO: implement MediaRecorder wrapper
  //
  // 1. Request microphone permission: navigator.mediaDevices.getUserMedia({ audio: true })
  // 2. Create MediaRecorder with preferred mimeType (webm or wav)
  // 3. Collect chunks in ondataavailable
  // 4. On stop, assemble chunks into a single Blob
  // 5. Return control functions (start/stop/pause/resume)
  //
  // Preferred mimeType priority:
  //   - audio/webm;codecs=opus (smallest, good quality)
  //   - audio/webm
  //   - audio/mp4
  //   - audio/wav (fallback, large files)

  throw new Error('createRecorder not implemented — see lib/audio-recorder.ts')
}
