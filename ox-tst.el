;;; ox-tst.el --- Tree-sitter test backend for Org Export Engine -*- lexical-binding: t -*-

;;; Commentary
;;; Code

(require 'ox)

;;; Internal

;;;; Variables

;; Specifiable keyword symbols defined for test-block (org node: special-block) attributes.
(defconst presence-properties '(:error :extract))


;;;; Functions

;; For consumers to use?
(defun tst-export-current ()
  "Export current buffer using ox-tst backend"
  (org-export-as 'tst))

(defun tst--write-string-to-file (string file)
  ;; TODO: Handle already absolute file names, currently always assuming relative. `file-name-absolute-p`.
  (write-region string nil file))

(defun tst--str-to-plist (str)
  "Convert string STR of custom keyword attributes to plist
and return said list."
  ;; Only support present/not-present properties currently.
  (let ((fragments (split-string str "[ ]+"))
		(ret (list))
		frg)
    (while (and fragments
				;; Any custom keywords should be pre-interned by being set in `presence-properties`.
				(setq frg (intern-soft (pop fragments))))
      (when (member frg presence-properties)
		(setq ret (plist-put ret frg t))))
    ret))

(defun tst--get-special-block-contents (special-block)
  "Return literal text content of SPECIAL-BLOCK even after
AST modifications."
  ;; Compared to the `buffer-substring-no-properties` approach this returns the original text
  ;; even after AST modifications that render using `:contents-begin` and `:contents-end` incorrect
  ;; and is simpler than `org-element-map`ing over deeply nested (eventual) plain-text elements
  ;; and calling `org-export-expand` (if indeed the latter even works).
  (org-element-interpret-data (org-element-contents special-block)))

(defun tst--test-block-attributes (special-block)
  "Return plist for string-quoted :parameters property on
given SPECIAL-BLOCK."
  (tst--str-to-plist (or (org-element-property :parameters special-block) "")))

(defun tst--make-error-test-title (plist count &optional annotation)
  "Returns a test title string given a PLIST containing the
base title string under property :test-name and the current
error test number COUNT under a specific headline."
  (concat
   (plist-get plist :test-name)
   (concat " (Bad) " (number-to-string count) (when annotation
												(concat " [" annotation "]")))))

;; TODO: I suspect this isn't the most elegant way to do this?
(defun tst--get-error-test-parent-item-contents (special-block)
  "Returns the paragraph contents for the parent list item
of the given SPECIAL-BLOCK as a string."
  (string-trim-right (org-element-map
						 (org-element-lineage special-block 'item)
						 'paragraph
					   #'org-element-interpret-data
					   nil
					   t)))


;;; Filters

(defun tst-test-block-filter (tree backend info)
  (tst--merge-test-blocks tree info))

(defun tst-anchor-headlines-filter (tree backend info)
  (tst--anchor-to-export-headlines tree info))

(defun tst--anchor-to-export-headlines (tree info)
  "Raise headlines containing :EXPORT_FILE_NAME property to
root of AST, deleting parents (which would not have such
property) while doing so.

Also expand :EXPORT_FILE_NAME to absolute path ready
for use later in export backend."
  (let ((anchors (org-element-map tree 'headline
				   (lambda (hl)
					 (let ((file-name (org-element-property :EXPORT_FILE_NAME hl)))
					   (when file-name
						 ;; Expand to absolute path.
						 (org-element-put-property hl :EXPORT_FILE_NAME
												   (expand-file-name
													file-name
													;; TODO: Allow hardcoded "test/corpus" to be configurable.
													(file-name-concat (file-name-directory (plist-get info :input-file)) "test/corpus")))
						 (when (org-export-get-parent-headline hl)
						   hl)))))))
    ;; (inspector-inspect tree)
    ;; Raise headline.
    (mapc (lambda (hl)
			(org-element-set
			 (car (last (org-element-lineage-map hl #'identity 'headline))) ; Top-parent.
			 hl)) ; Current.
		  anchors)

    tree))

(defun tst--merge-test-blocks (tree info)
  "Merge contiguous test blocks under the same heading, at the same
heading level, into a single test block. TREE is the org AST. INFO
is a global communication plist with contextual information."
  (org-element-map tree 'special-block
    (lambda (special-block)
	  (let ((error-test-count 1)
			;; Test title base for blocks at this headline (remove cdr if want full path).
			(title-base (mapconcat #'identity (cdr (nreverse
													(org-element-lineage-map
														special-block
														(lambda (hl) (org-element-property :raw-value hl))
													  'headline t)))
								   " / "))
			;; Special-block siblings at current headline level (no recursion).
			(siblings (org-element-map
						  (org-element-contents (org-element-lineage special-block 'headline))
						  'special-block #'identity info nil 'headline))
			;; Non-error test-blocks to merge for this headline.
			(merged-blocks ()))

		(dolist (--sb siblings (setq merged-blocks (nreverse merged-blocks)))
		  (let ((--sb-info (org-combine-plists
							(tst--test-block-attributes --sb) (list :test-name title-base))))
			(cond
			 ;; Error test.
			 ((plist-get --sb-info :error)
			  (org-element-set --sb (org-element-create
									 'test-block
									 ;; Set error test title.
									 ;; (plist-put --sb-info :test-name (tst--make-error-test-title --sb-info error-test-count))
									 (plist-put
									  --sb-info
									  :test-name (tst--make-error-test-title
												  --sb-info
												  error-test-count
												  (tst--get-error-test-parent-item-contents --sb)))
									 (concat (tst--get-special-block-contents --sb) "---")))
			  (setq error-test-count (1+ error-test-count)))

			 ;; Normal (non-error) test
			 ((not (plist-get --sb-info :error))
			  (if (seq-empty-p merged-blocks) ; First normal test block in this headline?
				  ;; TODO: Only save first blocks properties, not important right now but (maybe) in future more properties = need to do this with more granularity.
				  (push (cons --sb --sb-info) merged-blocks) ; Yes, save it (to merge others into).
				(org-element-extract --sb)) ; No, remove it from the AST.

			  (push (tst--get-special-block-contents --sb) merged-blocks)))
			))
		;; Encountered normal test block(s), format and merge contents into the first seen.
		(when merged-blocks
		  (org-element-set
		   (caar merged-blocks) ; Saved first normal test block.
		   (org-element-create 'test-block
							   (cdar merged-blocks) ; Saved first normal test block custom properties.
							   (let ((--haircut (mapcar (lambda (str)
														  ;; Strip all leading/trailing newlines from split substrings.
														  ;; XXX: split-string regex limits make this the easiest route, don't try improve.
														  (split-string str "---" nil "\n+"))
														(cdr merged-blocks)))) ; Extracted contents of all normal blocks in same headline.
								 ;; Add newlines for nicer spacing (which may(not) have been present before).
								 (concat
								  (mapconcat #'car --haircut "\n\n") ; Noir syntax in car (first list).
								  "\n\n---\n\n"
								  (concat ; Wrap parse-tree assertion XXX in "(source_file XXX)"
								   "(source_file\n"
								   (replace-regexp-in-string "\\(^\\).+$" "  " (mapconcat #'cadr --haircut "\n\n") nil nil 1) ; Parse-tree assertion in cadr (second list).
								   "\n)")
								  )))))
		) ; Close let.
	  )) ; Close lambda and map.
  ;; (inspector-inspect tree)
  tree)



;;; Transcoders

;;;; Section

(defun tst-section (section contents info)
  "Transcode SECTION org element to tree-sitter test text.
CONTENTS holds section's contents. INFO is a global communication
plist with contextual information."
  contents)


;;;; Headline

(defun tst-headline (headline contents info)
  "Transcode HEADLINE org element to tree-sitter test text.
CONTENTS holds headline's contents. INFO is global communication
plist with contextual information."
  (if-let ((export-file-name (org-element-property :EXPORT_FILE_NAME headline)))
	  (tst--write-string-to-file
	   (replace-regexp-in-string "\n\\(^\\)===+\n.+\\(?:\n.+\\)*\n===+" "\n\n" contents nil t 1)
	   export-file-name)
    contents))


;;;; Plain list

(defun tst-plain-list (plain-list contents info)
  contents)


;;;; Item

(defun tst-item (item contents info)
  ;; No post-blank on list items, we set spacing ourselves via regex.
  (org-element-put-property item :post-blank 0)
  contents)


;;;; Pseudo-object: test block

(defun tst-test-block (test-block contents info)
  "Transcode a TEST-BLOCK pseudo-object to tree-sitter test text.
CONTENTS holds test-block's contents. INFO is a global communication
plist with contextual information.

Test text comprised of test title with any test attributes (e.g. :error)
all wrapped in = (equals sign); followed by test syntax, a delimiter
of --- and (if appropriate) a tree-sitter parse-tree for assertion."
  (let* ((test-name (org-element-property :test-name test-block))
		 (test-name-width (string-width test-name))
		 (test-name-wrap (make-string test-name-width ?=)))
    (concat test-name-wrap "\n"
			test-name "\n"
			(when (org-element-property :error test-block)
			  ":error\n")
			test-name-wrap "\n\n"
			contents)))



;;; Define backend

(org-export-define-backend 'tst
  '((section . tst-section)
	(headline . tst-headline)
	(plain-list . tst-plain-list)
	(item . tst-item)
	;; Pseudo objects.
	(test-block . tst-test-block))
  :filters-alist '((:filter-parse-tree tst-anchor-headlines-filter
									   tst-test-block-filter)))
