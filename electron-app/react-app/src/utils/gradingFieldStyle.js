/**
 * MUI outlined-input border hint from session grading state.
 * @param {Record<string, import('./aiContracts').GradeAnswerResult>|undefined} grading
 * @param {string} fieldId
 */
export function gradingOutlineSx(grading, fieldId) {
  const result = grading?.[fieldId];
  if (!result?.ok || result.correct == null) return undefined;
  if (result.correct) {
    return { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'success.main' } };
  }
  return { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'error.main' } };
}
