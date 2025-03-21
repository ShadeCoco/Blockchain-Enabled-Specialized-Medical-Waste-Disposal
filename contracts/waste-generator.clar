;; waste-generator.clar
;; Records sources of medical waste

(define-data-var last-generator-id uint u0)

(define-map generators
  { generator-id: uint }
  {
    name: (string-utf8 100),
    address: (string-utf8 100),
    license-number: (string-utf8 50),
    registration-date: uint,
    active: bool
  }
)

(define-public (register-generator (name (string-utf8 100)) (address (string-utf8 100)) (license-number (string-utf8 50)))
  (let
    (
      (new-id (+ (var-get last-generator-id) u1))
    )
    (var-set last-generator-id new-id)
    (map-set generators
      { generator-id: new-id }
      {
        name: name,
        address: address,
        license-number: license-number,
        registration-date: (unwrap-panic (get-block-info? time u0)),
        active: true
      }
    )
    (ok new-id)
  )
)

(define-public (deactivate-generator (generator-id uint))
  (let
    (
      (generator (unwrap! (map-get? generators { generator-id: generator-id }) (err u404)))
    )
    (map-set generators
      { generator-id: generator-id }
      (merge generator { active: false })
    )
    (ok true)
  )
)

(define-read-only (get-generator (generator-id uint))
  (map-get? generators { generator-id: generator-id })
)

(define-read-only (is-generator-active (generator-id uint))
  (default-to false (get active (map-get? generators { generator-id: generator-id })))
)
