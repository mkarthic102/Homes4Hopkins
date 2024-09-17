import { InjectRepository } from "@nestjs/typeorm";
import { PostImage } from "./post-image.entity";
import { Repository, UpdateResult } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ImageMetadataDTO } from "./image-metadata.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class PostImageService {
  constructor(
    @InjectRepository(PostImage)
    private postImageRepository: Repository<PostImage>,
  ) {}

  async findAll(
    postId: string
  ): Promise<PostImage[]> {
    return this.postImageRepository.find({
      where: {
        postId: postId,
      },
      order: {
        timestamp: "ASC",
      }
    });
  }

  async addBatch(
    newImagesData: ImageMetadataDTO[],
    postId: string
  ): Promise<PostImage[]> {
    return Promise.all(
      newImagesData.map((imgData) => this.add(imgData, postId))
    );
  }

  async add(
    newImageData: ImageMetadataDTO,
    postId: string
  ): Promise<PostImage> {
    const postImage = await this.postImageRepository.create({
      url: newImageData.url,
      path: newImageData.path,
      postId,
    });
    return this.postImageRepository.save(postImage);
  }

  async softDelete(ids: string[]): Promise<UpdateResult> {
    return await this.postImageRepository
      .createQueryBuilder()
      .softDelete()
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async batchDeleteImagesFromStorage() {
    // Create Supabase client
    const SUPABASE_URL = process.env.SUPABASE_STORAGE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_STORAGE_ANON_KEY;    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('===== Batch Deleting =====');
    // Get softDeleted images
    const imagesToRemove = await this.postImageRepository
      .createQueryBuilder('post_image')
      .withDeleted() // Include soft deleted rows
      .where('post_image.deletedAt IS NOT NULL') // Filter soft deleted rows
      .orWhere('post_image.postId IS NULL') // Catch orphaned rows with DeleteDateColumn not set
      .getMany();
    if (imagesToRemove.length === 0) {
      console.log('===== Nothing to Delete. Terminate =====')
      return;
    }
    console.log('Number of Soft-deleted rows:', imagesToRemove.length);
    // Call Supabase storage API to remove images
    console.log('...Asking Supabase to delete...')
    const pathsToRemove = imagesToRemove.map(imgData => imgData.path);
    const { data, error } = await supabase.storage.from('post-images').remove(pathsToRemove); 
    console.log('Number of images Supabase deleted', data.length);
    if ( error ) return; // handle Supabase delete errors, make sure all posts deleted successfully
    // Delete soft-deleted rows from our DB.
    const idsToDelete = imagesToRemove.map(imgData => imgData.id);
    console.log('...Deleting soft-deleted rows from our DB...')
    await this.permanentlyDeleteSoftDeletedRows( idsToDelete );
    console.log('===== Done =====');
    return;
  }

  async permanentlyDeleteSoftDeletedRows( idsToDelete: string[] ) {
    await this.postImageRepository
      .createQueryBuilder('post_image')
      .withDeleted()
      .delete()
      .from('post_image')
      .where('post_image.id IN (:...idsToDelete)', { idsToDelete })
      .execute()
      .catch(error => console.log(error))
    return;
  }
}