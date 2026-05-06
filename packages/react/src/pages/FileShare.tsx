import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useLocation } from "react-router-dom";

import { 
  AudioBox,
  ControlBar,
  ControlBarDivider,
  ControlCheckbox,
  FileCard,
  FileUploadButton,
  FilesGrid,
  HiddenFileInput,
  ImageSource,
  SearchInput,
  StyledPagination,
  StyledStack,
  UploadErrorPopup,
  VideoBox,
  VideoSource
} from './FileShare.styles';
import AdminModal from './modals/AdminModal';

const FILES_PER_ROW = 5;
const ROWS = 2;
const FILES_PER_PAGE = ROWS * FILES_PER_ROW;
const MAX_FILE_SIZE = 150 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 150;

const FileTypeEnum = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  PDF: 'pdf',
  OTHER: 'other'
} as const;

interface FileData {
  name: string;
  file_type: string;
  url: string;
  special: boolean;
  created: string;
}

interface UploadResult {
  status: 'success' | 'failed' | 'db error';
  filename?: string;
  message?: string;
  error?: string;
  filesize?: number;
}

function determineFileType(fileType: string): typeof FileTypeEnum[keyof typeof FileTypeEnum] {
  if (fileType.match(/(png|jpg|jpeg|gif|webp|ico)$/i)) {
    return FileTypeEnum.IMAGE;
  } else if (fileType.match(/(mp4|webm|ogg|mkv)$/i)) {
    return FileTypeEnum.VIDEO;
  } else if (fileType.match(/(mp3)$/i)) {
    return FileTypeEnum.AUDIO;
  } else if (fileType.match(/(pdf)$/i)) {
    return FileTypeEnum.PDF;
  } else {
    return FileTypeEnum.OTHER;
  }
}

function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = sessionStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const ErrorPopup = ({ error, onClose }: { error: string | null, onClose: () => void }) => (
  error ? (
    <UploadErrorPopup>
      <strong>Upload Error:</strong> {error}
      <button onClick={onClose} style={{ marginLeft: '1rem' }}>Close</button>
    </UploadErrorPopup>
  ) : null
);

const PaginationBar = ({
  count,
  page,
  onChange,
  siblings,
  ...props
}: {
  count: number;
  page: number;
  onChange: (event: unknown, page: number) => void;
  siblings: number;
  $bar?: boolean;
  $top?: boolean;
}) => (
  <StyledStack spacing={1} {...props}>
    <StyledPagination count={count} page={page} onChange={onChange} siblingCount={siblings} variant="outlined" shape="rounded" />
  </StyledStack>
);

const FilesGridCards = ({
  files,
  showNSFW,
  determineFileType,
  isAdmin,
  onFileClick
}: {
  files: FileData[];
  showNSFW: boolean;
  determineFileType: (fileType: string) => typeof FileTypeEnum[keyof typeof FileTypeEnum];
  isAdmin: boolean;
  onFileClick?: (file: FileData) => void;
}) => (
  <FilesGrid>
    {files.map((file, index) => {
      const isBlurred = file.special && !showNSFW;
      const type = determineFileType(file.file_type);
      
      const handleClick = (e: React.MouseEvent) => {
        if (isAdmin && onFileClick) {
          e.preventDefault();
          onFileClick(file);
        }
      };

      switch (type) {
        case FileTypeEnum.VIDEO:
          return (
            <FileCard key={file.name} onClick={handleClick} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
              <VideoBox $blur={isBlurred} controls>
                <VideoSource src={file.url} />
                Your browser does not support the video tag.
              </VideoBox>
            </FileCard>
          );
        case FileTypeEnum.IMAGE:
          return (
            <FileCard 
              key={index} 
              href={isAdmin ? undefined : file.url} 
              rel="noopener noreferrer"
              onClick={handleClick}
              style={{ cursor: isAdmin ? 'pointer' : 'default' }}
            >
              <ImageSource src={file.url} alt={file.url} $blur={isBlurred} />
            </FileCard>
          );
        case FileTypeEnum.AUDIO:
          return (
            <FileCard key={file.name + '.' + file.file_type} onClick={handleClick} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
              <AudioBox controls src={file.url}>
                Your browser does not support the audio element.
              </AudioBox>
            </FileCard>
          );
        case FileTypeEnum.PDF:
          return (
            <FileCard key={index} onClick={handleClick} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
              <iframe src={file.url} width="100%" height="100%" title={file.name} />
            </FileCard>
          );
        default:
          return (
            <FileCard 
              key={index} 
              href={isAdmin ? undefined : file.url} 
              rel="noopener noreferrer"
              onClick={handleClick}
              style={{ cursor: isAdmin ? 'pointer' : 'default' }}
            >
              {file.name + "." + file.file_type}
            </FileCard>
          );
        }
      }
    )}
  </FilesGrid>
);

const ControlBarSection = ({
  page,
  handlePageChange,
  search,
  handleSearchChange,
  showNSFW,
  handleShowNsfwChange,
  uploadNSFW,
  handleUploadNsfwChange,
  handleUploadClick,
  fileInputRef,
  handleFileChange,
  count
}: {
  page: number;
  handlePageChange: (event: unknown, page: number) => void;
  search: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showNSFW: boolean;
  handleShowNsfwChange: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadNSFW: boolean;
  handleUploadNsfwChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  count: number;
}) => (
  <ControlBar>
    <PaginationBar
      count={count}
      page={page}
      onChange={handlePageChange}
      siblings={2}
      $bar={true}
    />
    <SearchInput
      type="text"
      placeholder="Search..."
      value={search}
      onChange={handleSearchChange}
    />
    <ControlCheckbox>
      <input
        type="checkbox"
        checked={showNSFW}
        onChange={handleShowNsfwChange}
      />
      Show NSFW
    </ControlCheckbox>
    <ControlBarDivider />
    <FileUploadButton type="button" onClick={handleUploadClick}>
      Upload File
    </FileUploadButton>
    <HiddenFileInput
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      multiple
    />
    <ControlCheckbox>
      <input
        type="checkbox"
        checked={uploadNSFW}
        onChange={handleUploadNsfwChange}
      />
      Tag NSFW
    </ControlCheckbox>
  </ControlBar>
);

const FileShare = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAdmin = searchParams.get('admin') === 'true';

  useEffect(() => {
    document.title = "Fileshare Is Me";
  }, []);

  const [files, setFiles] = useState<FileData[]>([]);
  const [total_files, setTotalFiles] = useState<number>(0);
  const [page, setPage] = usePersistentState<number>('currentPage', 1);
  const [search, setSearch] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNSFW, setShowNsfwChecked] = usePersistentState<boolean>('showNSFW', false);
  const [uploadNSFW, setUploadNsfwChecked] = useState<boolean>(false);
  const [refreshFiles, setRefreshFiles] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Admin modal state
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const maxPage = Math.ceil(total_files / FILES_PER_PAGE);

  const handleShowNsfwChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowNsfwChecked(e.target.checked);
  };

  const handleUploadNsfwChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadNsfwChecked(e.target.checked);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    if (newSearch !== search) {
      setPage(1);
    }
    setSearch(newSearch);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePageChange = (_event: unknown, pageNum: number) => {
    setPage(pageNum);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files;
    if (!filesList || !filesList.length) return;
    const formData = new FormData();
    for (let i = 0; i < filesList.length; i++) {
      if (filesList[i]!.size > MAX_FILE_SIZE) {
        setUploadError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      formData.append('files[]', filesList[i]!);
    }
    formData.append('nsfw', uploadNSFW ? '1' : '0');

    try {
      const response = await fetch('/php-api/fileshare/uploadFiles.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      // Check for actual upload failures
      if (data.results) {
        const failedUploads = data.results.filter((result: UploadResult) => 
          result.status === 'failed'
        );
        const dbErrors = data.results.filter((result: UploadResult) => 
          result.status === 'db error'
        );

        if (failedUploads.length > 0) {
          setUploadError(`${failedUploads.length} files failed to upload`);
          return;
        }
        
        if (dbErrors.length > 0) {
          setUploadError(`Database errors occurred for ${dbErrors.length} files`);
          return;
        }
      }

      // Only refresh if all uploads actually succeeded
      setRefreshFiles(r => !r);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError('Upload failed: ' + errorMessage);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    const start = (page - 1) * FILES_PER_PAGE;
    let apiCall = `/php-api/fileshare/getFilesAndCount.php?start=${start}&size=${FILES_PER_PAGE}`;
    if (search) {
      apiCall += `&search=${encodeURIComponent(search)}`;
    }
    fetch(apiCall, {
      headers: {
        'X-Frontend-Host': window.location.host
      }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data.status === 'error') {
          throw new Error(data.message || 'Upload failed');
        }
        return data;
      })
      .then(data => {
        const [total, ...results] = data;
        setTotalFiles(total.total_files);
        setFiles(results);
        setUploadError(null);
      })
      .catch(err => {
        setFiles([]);
        setUploadError(err.message || 'Unknown error');
      });
  }, [page, search, refreshFiles]);

  const handleFileClick = (file: FileData) => {
    if (isAdmin) {
      setSelectedFile(file);
      setShowAdminModal(true);
    }
  };

  const handleAdminUpdate = async (updatedData: Partial<FileData>) => {
    if (!selectedFile) return;

    try {
      const response = await fetch('/php-api/fileshare/updateFile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalName: selectedFile.name,
          fileType: selectedFile.file_type,
          newName: updatedData.name,
          special: updatedData.special ? 1 : 0
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Update failed');
      }

      setRefreshFiles(r => !r);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Update failed');
      throw error;
    }
  };

  const handleAdminDelete = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch('/php-api/fileshare/deleteFile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: selectedFile.name,
          fileType: selectedFile.file_type
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Delete failed');
      }

      setRefreshFiles(r => !r);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Delete failed');
      throw error;
    }
  };

  return (
    <>
      <ErrorPopup error={uploadError} onClose={() => setUploadError(null)} />
      <ControlBarSection
        count={maxPage}
        page={page}
        handlePageChange={handlePageChange}
        search={search}
        handleSearchChange={handleSearchChange}
        showNSFW={showNSFW}
        handleShowNsfwChange={handleShowNsfwChange}
        uploadNSFW={uploadNSFW}
        handleUploadNsfwChange={handleUploadNsfwChange}
        handleUploadClick={handleUploadClick}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />
      <PaginationBar
        count={maxPage}
        page={page}
        onChange={handlePageChange}
        siblings={1}
        $top={true}
      />
      <FilesGridCards
        files={files}
        showNSFW={showNSFW}
        determineFileType={determineFileType}
        isAdmin={isAdmin}
        onFileClick={handleFileClick}
      />
      <PaginationBar
        count={maxPage}
        page={page}
        onChange={handlePageChange}
        siblings={1}
      />
      
      {showAdminModal && selectedFile && (
        <AdminModal
          file={selectedFile}
          onClose={() => {
            setShowAdminModal(false);
            setSelectedFile(null);
          }}
          onUpdate={handleAdminUpdate}
          onDelete={handleAdminDelete}
        />
      )}
    </>
  )
}

export default FileShare;