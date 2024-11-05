;;; ox-ngd.el --- Derived HTML Org Export Engine backend for Noir Treesitter Grammar documentation -*- lexical-binding: t -*-

;;; Commentary
;;; Code

(require 'ox)
(require 'magit)

;;; Internal

;;;; Variables

;;;; Functions

;;; Brutally copy-pasted from org-html-export-to-html (with required changes for ngd).
(defun org-ngd-export-to-html
    (&optional async subtreep visible-only body-only ext-plist)
  (interactive)
  (let* ((extension (concat
					 (when (> (length org-html-extension) 0) ".")
					 (or (plist-get ext-plist :html-extension)
						 org-html-extension
						 "html")))
		 (file (org-export-output-file-name extension subtreep))
		 (org-export-coding-system org-html-coding-system))
    (org-export-to-file 'ngd file 		; Said single change here, 'ngd symbol instead of 'html.
      async subtreep visible-only body-only ext-plist)))

(defun ngd--inline-noir-info (backend)
  "Inline Noir version and submodule path (relative to repo
root) before macro expansion in source Org buffer so these
are easily available after initial AST creation in the
global communication INFO plist."
  (when (eq backend 'ngd)
	;; XXX: Or use `magit-git-str' instead?
	;; XXX: `git' annoyingly has a single space prefixed at the output of this command.
	;; XXX: Probably heavy handed and not really needed to depend on Magit but optimise (if even required) later.
	(let ((noir-submodule-info (split-string (magit-git-string-ng "submodule" "status") " " t)))
	  (when (length> noir-submodule-info 1)
		(insert "#+NOIR_VERSION: " (car noir-submodule-info) "\n")
		(insert "#+NOIR_SUBMODULE: " (nth 1 noir-submodule-info) "\n")))))


;;;; Hooks

;; Before any macro expansions in Org buffer.
(add-hook 'org-export-before-processing-functions #'ngd--inline-noir-info)


;;; Filters

;; Trying to force options by using :options-alist on the derived mode or other means does work but (and is documented to) takes lower precedence than in-buffer settings or those from any KEYWORD/OPTION. A filter on the options and forcibly setting them looks like the proper blessed way and is what is being done here.
(defun ngd--force-required-export-options (info backend)
  ;; Force required options.
  (plist-put info :html-doctype "html5")
  (plist-put info :html-html5-fancy t)
  (plist-put info :with-broken-links t))

(defun ngd-noirc-link-filter (tree backend info)
  (ngd--forge-format-noirc-links tree info))

(defun ngd--forge-format-noirc-links (tree info)
  "TODO docs"
  (let ((forge-template (plist-get info :ngd-forge-template-url))
		(noir-version (plist-get info :ngd-submodule-commit))
		(noir-submodule (plist-get info :ngd-submodule-path)))
	(org-element-map tree 'link
	  (lambda (nd)
		(when-let (((string= (org-element-property :type nd) "file"))
				   (path (org-element-property :path nd))
				   ((string-prefix-p noir-submodule path))
				   (search-option (org-element-property :search-option nd)))
		  (with-temp-buffer
			(let ((proc (make-process :name "idunno"
									  :command `("rg"
												 "--fixed-strings" ; No regex.
												 "--stop-on-nonmatch" ; After match stop searching that file.
												 "--column"
												 "--no-heading" ; No file names/paths in output.
												 "--only-matching" ; Only print matched text...
												 "--replace=" ; ...and replace it with nothing.
												 "--line-buffered" ; No water-line buffering, print immediately.
												 ;; "--debug" ; Smash head into wall time.
												 ;; ,(org-element-property :search-option nd)
												 ,search-option
												 ,(expand-file-name path (project-root (project-current))))
									  :connection-type 'pipe
									  :buffer (current-buffer)
									  ;; Comment :senitnel if debugging `make-process' for sanity.
									  :sentinel #'ignore)))
			  (unless proc (error "Failed to create process"))
			  (while (accept-process-output proc))
			  ;; TODO: Error handling.
			  (when-let ((snippet-loc (split-string (buffer-string) ":" t "[^0-9]"))
						 ((length= snippet-loc 2)))
				(message "========> %s // %s // %s" (buffer-string) snippet-loc (length snippet-loc))
				(org-element-put-property nd :search-option nil) ; Clear so Org (later) does nothing.
				;; XXX: Only support links to a single line for now.
				(org-element-put-property nd :path (format-spec forge-template
																`((?h . ,noir-version)
																  (?p . ,(string-remove-prefix (file-name-as-directory noir-submodule) path))
																  (?l . ,(car snippet-loc))
																  (?c . ,(nth 1 snippet-loc))
																  (?s . ,(+ (string-to-number (nth 1 snippet-loc)) (length search-option))))))
				nd)))))))
  tree)


;;; Transcoders

;;;; Link

(defun org-ngd-link (link contents info)
  ;; (let ((type (org-element-property :type link))
  ;; 		(path (org-element-property :path link))
  ;; 		(search-option (org-element-property :search-option link)))
  ;; 	(message "==> %s %s %s" type path search-option)
  ;; 	(when (string= type "file")
  ;; 	  (message "======> ord: %s" (org-export-get-ordinal link info))))
  ;; (with-temp-buffer
  ;; (org-link-open-as-file (concat path "::" search-option) 'emacs)
  ;; (message "=====> LINE NUMBER: %s" (line-number-at-pos (point))))))
  contents)
;; (Message "==> LINK: %s\n" link)
;; (message "==> CONTENTS: %s\n" contents)
;; (message "==> LINK PATH: %s" (org-element-property :path link))
;; (message "==> OPTIONS: %s\n" (plist-get info :ngd-bingbong))
;; (message "==> OPTIONS: %s\n" (plist-get info :html-doctype))
;; (message "==> MY CUSTOM: %s\n" (plist-get info :ngd-submodule-commit))
;; (message "==> SANITY: %s\n" (plist-get info :html-doctype))
;; contents)

;;; Define backend

(org-export-define-derived-backend 'ngd 'html
  ;; :translate-alist '((link . org-ngd-link))
  :filters-alist
  '((:filter-options . ngd--force-required-export-options)
	(:filter-parse-tree ngd-noirc-link-filter))
  ;; Docs for options-alist list elements: https://git.sr.ht/~bzg/org-mode/tree/main/item/lisp/ox.el#L157
  :options-alist
  '((:ngd-forge-template-url "NOIR_TEMPLATE_URL" nil nil nil)
	;; Before processing hook inlines Noir submodule version, this is purely so its automatically available in the global communication INFO plist. Whatever is literally present in the Org buffer before the processing hook runs will be ignored (i.e. user manually setting #+NOIR_VERSION ignored).
	(:ngd-submodule-commit "NOIR_VERSION" nil nil nil)
	(:ngd-submodule-path "NOIR_SUBMODULE" nil nil nil)))
