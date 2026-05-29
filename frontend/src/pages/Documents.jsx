import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Upload, FileText, FolderOpen, Tag, Trash2, Calendar } from 'lucide-react';
export default function Documents() {
 const [documents, setDocuments] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedCategory, setSelectedCategory] = useState(null);
 const [categories, setCategories] = useState([]);
 const [showUploadModal, setShowUploadModal] = useState(false);
 const [uploadFile, setUploadFile] = useState(null);
 const [uploadTitle, setUploadTitle] = useState('');
 const navigate = useNavigate();
 useEffect(() => {
 fetchDocuments();
 fetchCategories();
 }, []);
 async function fetchDocuments() {
 try {
 const response = await axios.get('/api/documents');
 setDocuments(response.data);
 }
 catch (error) {
 console.error('Failed to fetch documents:', error);
 }
 }
 async function fetchCategories() {
 try {
 const response = await axios.get('/api/categories');
 setCategories(response.data);
 }
 catch (error) {
 console.error('Failed to fetch categories:', error);
 }
 }
 async function handleSearch() {
 if (!searchTerm.trim()) {
 fetchDocuments();
 return;
 }
 try {
 const response = await axios.get(`/api/documents/search?keyword=${searchTerm}`);
 setDocuments(response.data);
 }
 catch (error) {
 console.error('Search failed:', error);
 }
 }
 async function handleDelete(id) {
 if (confirm('确定要删除这个文档吗？')) {
 try {
 await axios.delete(`/api/documents/${id}`);
 setDocuments(documents.filter(doc => doc.id !== id));
 }
 catch (error) {
 console.error('Delete failed:', error);
 }
 }
 }
 async function handleUpload() {
 if (!uploadFile)
 return;
 const formData = new FormData();
 formData.append('file', uploadFile);
 formData.append('title', uploadTitle || uploadFile.name);
 if (selectedCategory) {
 formData.append('categoryId', selectedCategory);
 }
 try {
 await axios.post('/api/documents/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 });
 setShowUploadModal(false);
 setUploadFile(null);
 setUploadTitle('');
 setSelectedCategory(null);
 fetchDocuments();
 }
 catch (error) {
 console.error('Upload failed:', error);
 }
 }
 const filteredDocuments = selectedCategory
 ? documents.filter(doc => doc.categoryId === selectedCategory)
 : documents;
 const fileIcon = (fileType) => {
 if (fileType.includes('pdf'))
 return 'bg-red-100 text-red-600';
 if (fileType.includes('word') || fileType.includes('docx'))
 return 'bg-blue-100 text-blue-600';
 if (fileType.includes('markdown') || fileType.includes('text'))
 return 'bg-green-100 text-green-600';
 return 'bg-gray-100 text-gray-600';
 };
 return (<div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-800">文档管理</h1>
 <p className="text-gray-500 mt-1">管理您的知识库文档</p>
 </div>
 <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
 <Upload className="w-5 h-5"/>
 上传文档
 </button>
 </div>

 <div className="flex gap-4 mb-6">
 <div className="flex-1 relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="搜索文档..."/>
 </div>
 <button onClick={handleSearch} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 搜索
 </button>
 </div>

 <div className="flex gap-2 mb-6 flex-wrap">
 <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-lg transition-colors ${!selectedCategory
 ? 'bg-blue-600 text-white'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
 全部
 </button>
 {categories.map(category => (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id
 ? 'bg-blue-600 text-white'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
 {category.name}
 </button>))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredDocuments.map(document => (<div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/documents/${document.id}`)}>
 <div className="flex items-start gap-3">
 <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${fileIcon(document.fileType)}`}>
 <FileText className="w-6 h-6"/>
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-medium text-gray-800 truncate group-hover:text-blue-600">
 {document.title}
 </h3>
 <p className="text-sm text-gray-500 mt-1 line-clamp-2">
 {document.summary || '暂无摘要'}
 </p>
 <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
 {document.category && (<span className="flex items-center gap-1">
 <FolderOpen className="w-3 h-3"/>
 {document.category.name}
 </span>)}
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3"/>
 {new Date(document.createdAt).toLocaleDateString()}
 </span>
 </div>
 {document.tags && document.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">
 {document.tags.slice(0, 3).map(tag => (<span key={tag.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
 <Tag className="w-3 h-3"/>
 {tag.name}
 </span>))}
 {document.tags.length > 3 && (<span className="text-xs text-gray-400">+{document.tags.length - 3}</span>)}
 </div>)}
 </div>
 <button onClick={(e) => { e.stopPropagation(); handleDelete(document.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </div>))}
 </div>

 {showUploadModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-6 w-full max-w-md">
 <h2 className="text-lg font-bold text-gray-800 mb-4">上传文档</h2>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">文档标题</label>
 <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="输入文档标题"/>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">选择分类</label>
 <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value ? +e.target.value : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
 <option value="">无分类</option>
 {categories.map(category => (<option key={category.id} value={category.id}>
 {category.name}
 </option>))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
 <input type="file" accept=".pdf,.docx,.md,.txt" onChange={(e) => setUploadFile(e.target.files[0])} className="w-full px-4 py-2 border border-gray-300 rounded-lg"/>
 </div>
 <div className="flex gap-3">
 <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadTitle(''); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
 取消
 </button>
 <button onClick={handleUpload} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
 上传
 </button>
 </div>
 </div>
 </div>
 </div>)}
 </div>);
}

