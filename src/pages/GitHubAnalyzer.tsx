import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Github, Folder, File, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  size: number;
  language: string;
  updated_at: string;
  html_url: string;
}

interface GitHubContentItem {
  name: string;
  type: string;
  size: number;
  path: string;
}

interface DirectoryItem {
  name: string;
  type: 'file' | 'dir';
  size: number;
  path: string;
}

interface RepositoryContents {
  repository: Repository;
  contents: DirectoryItem[];
  totalSize: number;
}

export default function GitHubAnalyzer() {
  const [githubToken, setGithubToken] = useState('');
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repositoryContents, setRepositoryContents] = useState<RepositoryContents[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchRepositories = useCallback(async () => {
    if (!githubToken || !username) {
      toast({
        title: "Hata",
        description: "Lütfen GitHub token ve kullanıcı adını girin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API hatası: ${response.status}`);
      }

      const repos: Repository[] = await response.json();
      setRepositories(repos);
      
      toast({
        title: "Başarılı",
        description: `${repos.length} repository bulundu`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Repository'ler alınamadı",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [githubToken, username, toast]);

  const getRepositoryContents = useCallback(async (repo: Repository, path: string = ''): Promise<DirectoryItem[]> => {
    const url = `https://api.github.com/repos/${repo.full_name}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`İçerik alınamadı: ${response.status}`);
    }

    const items = await response.json();
    return Array.isArray(items) ? items.map((item: GitHubContentItem) => ({
      name: item.name,
      type: item.type === 'dir' ? 'dir' as const : 'file' as const,
      size: item.size || 0,
      path: item.path,
    })) : [];
  }, [githubToken]);

  const analyzeRepositories = useCallback(async () => {
    if (repositories.length === 0) {
      toast({
        title: "Hata",
        description: "Önce repository'leri yükleyin",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    const contents: RepositoryContents[] = [];

    try {
      for (const repo of repositories) {
        try {
          const rootContents = await getRepositoryContents(repo);
          
          // Ana dizin boyutlarını hesapla
          const directorySizes = new Map<string, number>();
          let totalSize = 0;

          for (const item of rootContents) {
            if (item.type === 'dir') {
              try {
                const subContents = await getRepositoryContents(repo, item.path);
                const dirSize = subContents.reduce((sum, subItem) => sum + (subItem.size || 0), 0);
                directorySizes.set(item.name, dirSize);
                totalSize += dirSize;
              } catch (error) {
                // Dizin içeriği alınamazsa boyutu 0 olarak işaretle
                directorySizes.set(item.name, 0);
              }
            } else {
              totalSize += item.size || 0;
            }
          }

          // İçerikleri boyut bilgisiyle güncelle
          const enhancedContents = rootContents.map(item => ({
            ...item,
            size: item.type === 'dir' ? (directorySizes.get(item.name) || 0) : item.size,
          }));

          contents.push({
            repository: repo,
            contents: enhancedContents,
            totalSize,
          });
        } catch (error) {
          console.error(`Repository ${repo.name} analiz edilemedi:`, error);
          // Hatalı repository'leri boş içerikle ekle
          contents.push({
            repository: repo,
            contents: [],
            totalSize: 0,
          });
        }
      }

      setRepositoryContents(contents);
      toast({
        title: "Analiz Tamamlandı",
        description: `${contents.length} repository analiz edildi`,
      });
    } catch (error) {
      toast({
        title: "Analiz Hatası",
        description: error instanceof Error ? error.message : "Analiz sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [repositories, getRepositoryContents, toast]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfaya Dön
        </Button>
        <div className="flex items-center gap-2">
          <Github className="h-8 w-8" />
          <h1 className="text-3xl font-bold">GitHub Repository Analizi</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Bilgileri</CardTitle>
          <CardDescription>
            GitHub repository'lerinizi analiz etmek için Personal Access Token ve kullanıcı adınızı girin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Personal Access Token</label>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kullanıcı Adı</label>
              <Input
                placeholder="kullaniciadi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchRepositories} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Repository'leri Yükle
            </Button>
            {repositories.length > 0 && (
              <Button onClick={analyzeRepositories} disabled={analyzing} variant="secondary">
                {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analiz Et ({repositories.length} repo)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {repositories.length > 0 && (
        <Tabs defaultValue="repositories" className="w-full">
          <TabsList>
            <TabsTrigger value="repositories">Repository'ler ({repositories.length})</TabsTrigger>
            {repositoryContents.length > 0 && (
              <TabsTrigger value="analysis">Detaylı Analiz</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="repositories">
            <Card>
              <CardHeader>
                <CardTitle>Repository Listesi</CardTitle>
                <CardDescription>Toplam {repositories.length} repository bulundu</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {repositories.map((repo) => (
                      <div key={repo.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <h3 className="font-medium">{repo.name}</h3>
                          <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                          <Badge>{formatSize(repo.size * 1024)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {repositoryContents.length > 0 && (
            <TabsContent value="analysis">
              <div className="space-y-4">
                {repositoryContents.map((repoContent, index) => (
                  <Card key={repoContent.repository.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        {repoContent.repository.name}
                      </CardTitle>
                      <CardDescription>
                        Toplam Boyut: {formatSize(repoContent.totalSize)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-1">
                          {repoContent.contents.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                {item.type === 'dir' ? (
                                  <Folder className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <File className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="text-sm">{item.name}</span>
                              </div>
                              <Badge variant="outline">{formatSize(item.size)}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}