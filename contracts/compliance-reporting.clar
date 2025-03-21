;; compliance-reporting.clar
;; Generates documentation for regulatory requirements

(define-data-var last-report-id uint u0)

(define-map compliance-reports
  { report-id: uint }
  {
    generator-id: uint,
    collection-ids: (list 20 uint),
    treatment-ids: (list 20 uint),
    report-date: uint,
    regulatory-body: (string-utf8 100),
    report-hash: (buff 32),
    submitted: bool
  }
)

(define-public (create-report
    (generator-id uint)
    (collection-ids (list 20 uint))
    (treatment-ids (list 20 uint))
    (regulatory-body (string-utf8 100))
    (report-hash (buff 32)))
  (let
    (
      (new-id (+ (var-get last-report-id) u1))
    )
    (var-set last-report-id new-id)
    (map-set compliance-reports
      { report-id: new-id }
      {
        generator-id: generator-id,
        collection-ids: collection-ids,
        treatment-ids: treatment-ids,
        report-date: (unwrap-panic (get-block-info? time u0)),
        regulatory-body: regulatory-body,
        report-hash: report-hash,
        submitted: false
      }
    )
    (ok new-id)
  )
)

(define-public (submit-report (report-id uint))
  (let
    (
      (report (unwrap! (map-get? compliance-reports { report-id: report-id }) (err u404)))
    )
    (map-set compliance-reports
      { report-id: report-id }
      (merge report { submitted: true })
    )
    (ok true)
  )
)

(define-read-only (get-report (report-id uint))
  (map-get? compliance-reports { report-id: report-id })
)

(define-read-only (verify-report-integrity (report-id uint) (expected-hash (buff 32)))
  (let
    (
      (report (unwrap! (map-get? compliance-reports { report-id: report-id }) (err u404)))
    )
    (ok (is-eq (get report-hash report) expected-hash))
  )
)
