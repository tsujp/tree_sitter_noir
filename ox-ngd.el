;;; ox-ngd.el --- Derived HTML Org Export Engine backend for Noir Treesitter Grammar documentation -*- lexical-binding: t -*-

;;; Commentary
;;; Code

(require 'ox)
(require 'magit)

;;; Internal

;; Yoinked from: https://relint.de/emacs-export-faces.html
(defun exported-faces-list ()
  '(font-lock-comment-face font-lock-comment-delimiter-face
						   font-lock-string-face
						   font-lock-doc-face
						   font-lock-doc-markup-face
						   font-lock-keyword-face
						   font-lock-builtin-face
						   font-lock-operator-face
						   font-lock-bracket-face
						   font-lock-function-name-face
						   font-lock-variable-name-face
						   font-lock-type-face
						   font-lock-constant-face
						   font-lock-warning-face
						   font-lock-negation-char-face
						   font-lock-preprocessor-face
						   font-lock-regexp-grouping-backslash
						   font-lock-regexp-grouping-construct
						   bold
						   italic
						   bold-italic
						   underline
						   ;; fixed-pitch
						   ;; fixed-pitch-serif
						   ;; variable-pitch
						   ;; shadow
						   link
						   link-visited
						   highlight
						   region
						   secondary-selection
						   ;; line-number
						   ;; line-number-current-line
						   ;; line-number-major-tick
						   ;; line-number-minor-tick
						   ;; fill-column-indicator
						   escape-glyph
						   homoglyph
						   nobreak-space
						   nobreak-hyphen))

(defun export-face-colors (name)
  (let ((fl-exported (exported-faces-list)))
    (with-temp-buffer
      (insert (format "[data-theme=\"%s\"] {\n" name))
      (let* ((face-map (htmlize-make-face-map (cl-adjoin 'default fl-exported))))
        ;; default
        (insert "  /* default */\n")
        (insert (format "  --org-src-default-fg: %s;\n"
                        (htmlize-fstruct-foreground (gethash 'default face-map))))
        (insert (format "  --org-src-default-bg: %s;\n"
                        (htmlize-fstruct-background (gethash 'default face-map))))
        ;; go through the faces
        (insert "  /* faces */\n")
        (dolist (face fl-exported)
          (let ((fstruct (gethash face face-map)))
            (when (htmlize-fstruct-foreground fstruct)
              (insert (format "  --org-src-%s-fg: %s;\n"
                              (htmlize-fstruct-css-name fstruct)
                              (htmlize-fstruct-foreground fstruct))))

            (when (htmlize-fstruct-background fstruct)
              (insert (format "  --org-src-%s-bg: %s;\n"
                              (htmlize-fstruct-css-name fstruct)
                              (htmlize-fstruct-background fstruct)))))))
      (insert "}\n\n")
      (buffer-string))))

(defun export-faces ()
  (let ((fl-exported (exported-faces-list)))
    (with-temp-buffer
      (let* ((face-map (htmlize-make-face-map (cl-adjoin 'default fl-exported))))
        ;; default
        (insert "/* default */\n")
        (insert ".org-src-container {\n")
        (insert "  color: var(--org-src-default-fg);\n")
        (insert "  background-color: var(--org-src-default-bg);\n")
        (insert "}\n\n")
        ;; go through the faces
        (insert "/* faces */\n")
        (dolist (face fl-exported)
          (let* ((fstruct (gethash face face-map))
                 (css-name (htmlize-fstruct-css-name fstruct)))
            (insert (format ".org-%s {\n" css-name))
            (when (htmlize-fstruct-foreground fstruct)

              (insert (format "  color: var(--org-src-%s-fg);\n" css-name)))
            (when (htmlize-fstruct-background fstruct)
              (insert (format "  background-color: var(--org-src-%s-bg);\n" css-name)))
            (when (htmlize-fstruct-boldp fstruct)
              (insert "  font-weight: bold;\n"))

            (when (htmlize-fstruct-italicp fstruct)
              (insert "  font-style: italic;\n"))
            (when (htmlize-fstruct-underlinep fstruct)
              (insert "  text-decoration: underline;\n"))
            (when (htmlize-fstruct-overlinep fstruct)
              (insert "  text-decoration: overline;\n"))
            (when (htmlize-fstruct-strikep fstruct)
              (insert "  text-decoration: line-through;\n"))
            (insert "}\n\n")
            )))
      (buffer-string))))

(defun do-the-thing ()
  (with-temp-buffer
	(insert (export-face-colors "dark"))
	(insert (export-faces))
	(write-region nil nil "~/maybe.css" nil)))

;; END YOINK.

;;;; Variables

;;;; Functions

;; org-html-htmlize-generate-css

;;; Brutally copy-pasted from org-html-export-to-html (with required changes for ngd).
(defun org-ngd-export-to-html
    (&optional async subtreep visible-only body-only ext-plist)
  (interactive)
  ;; Changed: set org-html-htmlize-output-type to 'css, see: https://github.com/emacsmirror/org/blob/master/lisp/ox-html.el#L2027C13-L2027C41
  (let* ((org-html-htmlize-output-type 'css)
		 ;; (org-html-htmlize-font-prefix "tok-")
		 (extension (concat
					 (when (> (length org-html-extension) 0) ".")
					 (or (plist-get ext-plist :html-extension)
						 org-html-extension
						 "html")))
		 (file (org-export-output-file-name extension subtreep))
		 (org-export-coding-system org-html-coding-system))
    (org-export-to-file 'ngd file 		; Change: 'ngd symbol instead of 'html.
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
  (plist-put info :with-broken-links t)
  (plist-put info :html-style nil)
  (plist-put info :headline-levels 500)
  ;; (plist-put info :with-title nil)
  (plist-put info :html-head-include-default-style nil)
  (plist-put info :html-htmlized-css-url "style.css")
  (plist-put info :html-self-link-headlines t)
  ;; (plist-put info :html-content-class "bingbong")
  (plist-put info :html-divs (quote ((preamble "header" "preamble")
									 (content "div" "main-wrap")
									 (postamble "footer" "postamble"))))
  )

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
				(org-element-put-property nd :search-option nil) ; Clear so Org (later) does nothing.
				(org-element-put-property nd :attr_html '(":class noirc-link"))
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

;;;; Template

(defun org-ngd-template (contents info)
  "TODO: Docs"
  (concat
   "<!DOCTYPE html>\n"
   (format "<html lang=\"%s\" data-theme=\"dark\">\n" (plist-get info :language))
   "<head>\n"
   (format "<title>%s</title>\n" (org-html-plain-text
								  (org-element-interpret-data (plist-get info :title)) info))
   (format "<meta charset=\"%s\">\n"
           (coding-system-get org-html-coding-system 'mime-charset))
   "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
   (format "<meta name=\"author\" content=\"%s\">\n"
           (org-export-data (plist-get info :author) info))
   (org-html--build-head info)
   "</head>\n"
   "<body>\n"
   "<div id=\"main-wrap\">\n"
   (format "<header>\n<h1 class=\"title\">%s</h1>\n</header>\n"
           (org-export-data (or (plist-get info :title) "") info))
   contents
   "</div>\n"
   "</body>\n"
   ))

;;;; Inner template

(defun org-ngd-inner-template (contents info)
  "TODO: Docs"
  (concat
   ;; Table of contents.
   (let ((depth (plist-get info :with-toc)))
     (when depth (org-html-toc depth info)))
   ;; Document contents.
   "<div id=\"content-wrap\">" contents "</div>"
   ;; Footnotes section.
   (org-html-footnote-section info)))

;;; Define backend

(org-export-define-derived-backend 'ngd 'html
  ;; :translate-alist '((link . org-ngd-link))
  :translate-alist '((inner-template . org-ngd-inner-template)
					 (template . org-ngd-template))
  :filters-alist
  '((:filter-options . ngd--force-required-export-options)
	(:filter-parse-tree ngd-noirc-link-filter))
  ;; Docs for options-alist list elements: https://git.sr.ht/~bzg/org-mode/tree/main/item/lisp/ox.el#L157
  :options-alist
  '((:ngd-forge-template-url "NOIR_TEMPLATE_URL" nil nil nil)
	;; Before processing hook inlines Noir submodule version, this is purely so its automatically available in the global communication INFO plist. Whatever is literally present in the Org buffer before the processing hook runs will be ignored (i.e. user manually setting #+NOIR_VERSION ignored).
	(:ngd-submodule-commit "NOIR_VERSION" nil nil nil)
	(:ngd-submodule-path "NOIR_SUBMODULE" nil nil nil)))
